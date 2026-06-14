ELECTRONICS_CATEGORIES = ['electronics', 'phone', 'laptop', 'tablet', 'headphone', 
                           'camera', 'appliance', 'television', 'audio', 'computer']

def is_electronics(category: str) -> bool:
    if not category:
        return False
    return any(keyword in category.lower() for keyword in ELECTRONICS_CATEGORIES)

def decide_route(
    condition_tier: str,
    confidence: int,
    suggested_resale_price: int,
    refurbishment_needed: bool = False,
    functional_testing_required: bool = False,
    functional_testing_notes: str = None,
    category: str = ''
) -> dict:

    TRANSPORT_COST = 150
    REFURBISHMENT_COST_FLAT = 300
    LIQUIDATION_FLOOR = 400

    if condition_tier == 'Liquidate':
        return {
            'routing_decision': 'Liquidate',
            'routing_reason': 'Item has irreparable damage. No resale value even after refurbishment. Routed for liquidation.'
        }

    if functional_testing_required or is_electronics(category):
        testing_note = functional_testing_notes or 'Power on test, core functionality check, and component diagnostics required.'
        return {
            'routing_decision': 'Human Review — Functional Testing Required',
            'routing_reason': f'Visual grading complete. Functional testing mandatory before routing decision. Tests needed: {testing_note}'
        }

    if confidence < 70:
        return {
            'routing_decision': 'Human Review Required',
            'routing_reason': 'AI confidence too low for automated routing. Manual inspection needed before any decision.'
        }

    net_resale = suggested_resale_price - TRANSPORT_COST

    if condition_tier in ['Like New', 'Good'] and not refurbishment_needed:
        if net_resale > LIQUIDATION_FLOOR:
            return {
                'routing_decision': 'Resell on Amazon Rehome',
                'routing_reason': f'Item is in {condition_tier} condition. Net recovery ₹{net_resale} exceeds liquidation floor ₹{LIQUIDATION_FLOOR}. Ready for immediate listing.'
            }
        else:
            return {
                'routing_decision': 'Liquidate',
                'routing_reason': f'Item is in {condition_tier} condition but net recovery ₹{net_resale} does not exceed liquidation floor ₹{LIQUIDATION_FLOOR}. Not economically viable to list.'
            }

    if condition_tier == 'Acceptable' or refurbishment_needed:
        net_post_refurb = suggested_resale_price - TRANSPORT_COST - REFURBISHMENT_COST_FLAT
        if net_post_refurb > LIQUIDATION_FLOOR:
            return {
                'routing_decision': 'Refurbishment and Resell',
                'routing_reason': f'Item requires refurbishment before listing. Post refurbishment net recovery ₹{net_post_refurb} exceeds liquidation floor ₹{LIQUIDATION_FLOOR}. Must be re-graded as Good or Like New after refurbishment before appearing on Rehome.'
            }
        else:
            return {
                'routing_decision': 'Liquidate',
                'routing_reason': f'Item requires refurbishment but post refurbishment net recovery ₹{net_post_refurb} does not exceed liquidation floor ₹{LIQUIDATION_FLOOR}. Not economically viable to refurbish.'
            }

    return {
        'routing_decision': 'Liquidate',
        'routing_reason': 'No viable recovery route found.'
    }