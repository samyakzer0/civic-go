/**
 * Proof of Report Service - Handles creation and verification of tamper-proof report proofs
 * 
 * This service creates immutable proof-of-report records on IPFS for transparency and audit purposes.
 * Each proof contains minimal but essential data that can be independently verified.
 * 
 * Features:
 * - Generate minimal JSON proof objects
 * - Store proofs on IPFS for immutability
 * - Retrieve and verify existing proofs
 * - Fail-safe operation (doesn't break main reporting flow)
 * - Comprehensive logging for audit trails
 */

import { ipfsService, type ProofOfReportData, type IPFSResult } from './IPFSService';

/**
 * Interface for proof creation result
 */
export interface ProofCreationResult {
  success: boolean;
  cid?: string;
  proof?: ProofOfReportData;
  error?: string;
  timestamp?: string;
}

/**
 * Interface for proof verification result
 */
export interface ProofVerificationResult {
  success: boolean;
  isValid: boolean;
  proof?: ProofOfReportData;
  cid?: string;
  error?: string;
  verifiedAt?: string;
}

/**
 * Interface for proof metadata to store in Supabase
 */
export interface ProofMetadata {
  cid: string;
  proof_timestamp: string;
  city: string;
  created_at: string;
  verification_status?: 'pending' | 'verified' | 'failed';
}

/**
 * Proof of Report Service class
 */
class ProofOfReportService {
  
  /**
   * Create a proof-of-report for a given report
   * 
   * @param reportId - The unique identifier of the report
   * @param city - The city where the report was made
   * @param customTimestamp - Optional custom timestamp (defaults to current time)
   * @returns Promise<ProofCreationResult> - Result of proof creation operation
   */
  async createProofOfReport(
    reportId: string, 
    city: string, 
    customTimestamp?: string
  ): Promise<ProofCreationResult> {
    const operationStart = Date.now();
    console.log(`ProofService: Starting proof creation for report ${reportId} in ${city}`);

    try {
      // Generate timestamp in ISO-8601 format
      const timestamp = customTimestamp || new Date().toISOString();
      
      // Create minimal proof object
      const proofData: ProofOfReportData = {
        report_id: reportId,
        timestamp: timestamp,
        city: city
      };

      console.log(`ProofService: Generated proof data:`, proofData);

      // Store proof on IPFS
      const ipfsResult: IPFSResult = await ipfsService.storeJSON(proofData);

      if (!ipfsResult.success) {
        console.error(`ProofService: IPFS storage failed for report ${reportId}:`, ipfsResult.error);
        return {
          success: false,
          error: ipfsResult.error || 'Unknown IPFS error',
          timestamp: timestamp
        };
      }

      const operationTime = Date.now() - operationStart;
      console.log(`ProofService: Proof created successfully for report ${reportId} in ${operationTime}ms`);
      console.log(`ProofService: IPFS CID: ${ipfsResult.cid}`);

      return {
        success: true,
        cid: ipfsResult.cid,
        proof: proofData,
        timestamp: timestamp
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const operationTime = Date.now() - operationStart;
      
      console.error(`ProofService: Proof creation failed for report ${reportId} after ${operationTime}ms:`, errorMessage);
      
      return {
        success: false,
        error: `Proof creation failed: ${errorMessage}`,
        timestamp: customTimestamp || new Date().toISOString()
      };
    }
  }

  /**
   * Verify a proof-of-report by retrieving it from IPFS and validating its structure
   * 
   * @param cid - The IPFS Content Identifier of the proof
   * @param expectedReportId - Optional report ID to validate against
   * @returns Promise<ProofVerificationResult> - Result of proof verification
   */
  async verifyProofOfReport(
    cid: string, 
    expectedReportId?: string
  ): Promise<ProofVerificationResult> {
    const operationStart = Date.now();
    console.log(`ProofService: Starting proof verification for CID ${cid}`);

    try {
      // Retrieve proof from IPFS
      const ipfsResult: IPFSResult = await ipfsService.retrieveJSON(cid);

      if (!ipfsResult.success) {
        console.error(`ProofService: IPFS retrieval failed for CID ${cid}:`, ipfsResult.error);
        
        // Provide more user-friendly error messages
        let userFriendlyError = 'Failed to retrieve proof from IPFS network.';
        
        if (ipfsResult.error?.includes('Failed to initialize IPFS service')) {
          userFriendlyError = 'Unable to connect to IPFS network. This may be due to network restrictions or browser limitations. The proof exists but cannot be verified at this time.';
        } else if (ipfsResult.error?.includes('timeout')) {
          userFriendlyError = 'IPFS network request timed out. Please try again later.';
        } else if (ipfsResult.error?.includes('Invalid CID')) {
          userFriendlyError = 'The proof identifier is invalid or corrupted.';
        }
        
        return {
          success: false,
          isValid: false,
          error: userFriendlyError,
          cid: cid,
          verifiedAt: new Date().toISOString()
        };
      }

      const proof = ipfsResult.data as ProofOfReportData;
      
      // Validate proof structure
      const isValid = this.validateProofStructure(proof, expectedReportId);
      
      const operationTime = Date.now() - operationStart;
      
      if (isValid) {
        console.log(`ProofService: Proof verification successful for CID ${cid} in ${operationTime}ms`);
        console.log(`ProofService: Verified proof:`, proof);
      } else {
        console.warn(`ProofService: Proof validation failed for CID ${cid} in ${operationTime}ms`);
      }

      return {
        success: true,
        isValid: isValid,
        proof: proof,
        cid: cid,
        verifiedAt: new Date().toISOString()
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const operationTime = Date.now() - operationStart;
      
      console.error(`ProofService: Proof verification failed for CID ${cid} after ${operationTime}ms:`, errorMessage);
      
      return {
        success: false,
        isValid: false,
        error: `Proof verification failed: ${errorMessage}`,
        cid: cid,
        verifiedAt: new Date().toISOString()
      };
    }
  }

  /**
   * Validate the structure and content of a proof object
   * 
   * @param proof - The proof object to validate
   * @param expectedReportId - Optional report ID to validate against
   * @returns boolean - True if proof is valid
   */
  private validateProofStructure(proof: any, expectedReportId?: string): boolean {
    try {
      // Check if proof is an object
      if (!proof || typeof proof !== 'object') {
        console.error('ProofService: Proof is not a valid object');
        return false;
      }

      // Check required fields
      const requiredFields = ['report_id', 'timestamp', 'city'];
      for (const field of requiredFields) {
        if (!proof[field] || typeof proof[field] !== 'string') {
          console.error(`ProofService: Missing or invalid field: ${field}`);
          return false;
        }
      }

      // Validate timestamp format (basic ISO-8601 check)
      const timestamp = new Date(proof.timestamp);
      if (isNaN(timestamp.getTime())) {
        console.error('ProofService: Invalid timestamp format');
        return false;
      }

      // Validate report_id if provided
      if (expectedReportId && proof.report_id !== expectedReportId) {
        console.error(`ProofService: Report ID mismatch. Expected: ${expectedReportId}, Got: ${proof.report_id}`);
        return false;
      }

      // Validate city is not empty
      if (proof.city.trim().length === 0) {
        console.error('ProofService: City field is empty');
        return false;
      }

      return true;

    } catch (error) {
      console.error('ProofService: Error validating proof structure:', error);
      return false;
    }
  }

  /**
   * Create proof metadata object for Supabase storage
   * 
   * @param cid - The IPFS Content Identifier
   * @param proof - The proof object
   * @returns ProofMetadata - Metadata object for database storage
   */
  createProofMetadata(cid: string, proof: ProofOfReportData): ProofMetadata {
    return {
      cid: cid,
      proof_timestamp: proof.timestamp,
      city: proof.city,
      created_at: new Date().toISOString(),
      verification_status: 'pending'
    };
  }

  /**
   * Batch verify multiple proofs
   * 
   * @param proofs - Array of CID and optional report ID pairs
   * @returns Promise<ProofVerificationResult[]> - Array of verification results
   */
  async batchVerifyProofs(
    proofs: Array<{ cid: string; reportId?: string }>
  ): Promise<ProofVerificationResult[]> {
    console.log(`ProofService: Starting batch verification of ${proofs.length} proofs`);

    const verificationPromises = proofs.map(({ cid, reportId }) => 
      this.verifyProofOfReport(cid, reportId)
    );

    try {
      const results = await Promise.allSettled(verificationPromises);
      
      return results.map((result, index) => {
        if (result.status === 'fulfilled') {
          return result.value;
        } else {
          console.error(`ProofService: Batch verification failed for proof ${index}:`, result.reason);
          return {
            success: false,
            isValid: false,
            error: `Batch verification failed: ${result.reason}`,
            cid: proofs[index].cid,
            verifiedAt: new Date().toISOString()
          };
        }
      });

    } catch (error) {
      console.error('ProofService: Batch verification error:', error);
      throw error;
    }
  }

  /**
   * Get IPFS service status for debugging
   * 
   * @returns Promise<object> - Service status information
   */
  async getServiceStatus(): Promise<{
    ipfsReady: boolean;
    nodeInfo?: any;
    error?: string;
  }> {
    try {
      const isReady = ipfsService.isReady();
      const nodeInfo = await ipfsService.getNodeInfo();
      
      return {
        ipfsReady: isReady,
        nodeInfo: nodeInfo
      };
    } catch (error) {
      return {
        ipfsReady: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Test the service with a sample proof (for debugging)
   * 
   * @returns Promise<boolean> - True if test passes
   */
  async testService(): Promise<boolean> {
    try {
      console.log('ProofService: Running service test...');
      
      const testReportId = `test_${Date.now()}`;
      const testCity = 'Test City';
      
      // Create test proof
      const createResult = await this.createProofOfReport(testReportId, testCity);
      if (!createResult.success) {
        console.error('ProofService: Test failed during creation:', createResult.error);
        return false;
      }

      // Verify test proof
      const verifyResult = await this.verifyProofOfReport(createResult.cid!, testReportId);
      if (!verifyResult.success || !verifyResult.isValid) {
        console.error('ProofService: Test failed during verification:', verifyResult.error);
        return false;
      }

      console.log('ProofService: Service test passed successfully');
      return true;

    } catch (error) {
      console.error('ProofService: Service test failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const proofOfReportService = new ProofOfReportService();

// Export the class for testing purposes
export { ProofOfReportService };